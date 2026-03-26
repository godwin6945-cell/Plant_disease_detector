import os, time, platform
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'poseai_secret_2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///poseai.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ── Models ────────────────────────────────────────────────────────────

class Session(db.Model):
    __tablename__ = 'sessions'
    id         = db.Column(db.Integer, primary_key=True)
    module     = db.Column(db.String(50), nullable=False, index=True)
    duration   = db.Column(db.Float, default=0)
    score      = db.Column(db.Float, default=0)
    saved_at   = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    extra_json = db.Column(db.Text, default='{}')   # stores extra fields as JSON string

    def to_dict(self):
        import json
        d = {
            'id':       self.id,
            'module':   self.module,
            'duration': self.duration,
            'score':    self.score,
            'saved_at': self.saved_at.isoformat()
        }
        try:
            d.update(json.loads(self.extra_json or '{}'))
        except Exception:
            pass
        return d


class PersonalRecord(db.Model):
    __tablename__ = 'personal_records'
    id       = db.Column(db.Integer, primary_key=True)
    module   = db.Column(db.String(50), nullable=False, index=True)
    metric   = db.Column(db.String(100), nullable=False)
    value    = db.Column(db.Float, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('module', 'metric', name='uq_module_metric'),)

    def to_dict(self):
        return {'module': self.module, 'metric': self.metric, 'value': self.value}


class GameScore(db.Model):
    __tablename__ = 'game_scores'
    id         = db.Column(db.Integer, primary_key=True)
    game       = db.Column(db.String(50), nullable=False, index=True)
    score      = db.Column(db.Float, nullable=False)
    saved_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'game': self.game, 'score': self.score, 'timestamp': self.saved_at.isoformat()}


# ── Create tables on first run ────────────────────────────────────────
with app.app_context():
    db.create_all()

# ── Routes ────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/stats')
def stats():
    total = Session.query.count()
    return jsonify({
        'status':       'ok',
        'backend':      'SQLite + AMD WebGL',
        'server_time':  datetime.now().isoformat(),
        'uptime':       time.time(),
        'total_sessions': total
    })


@app.route('/api/save_session', methods=['POST'])
def save_session():
    import json
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No data'}), 400

        module   = data.pop('module', 'unknown')
        duration = float(data.pop('duration', 0))
        score    = float(data.pop('score', data.pop('averageScore', 0)))
        # Remove saved_at if frontend sends it
        data.pop('saved_at', None)

        # Store remaining fields as JSON
        session = Session(
            module     = module,
            duration   = duration,
            score      = score,
            extra_json = json.dumps(data)
        )
        db.session.add(session)

        # Auto-update personal records for numeric fields
        for key, value in data.items():
            if isinstance(value, (int, float)):
                _upsert_record(module, key, float(value))

        # Save game scores separately
        if module == 'games' and 'game' in data:
            gs = GameScore(game=data['game'], score=score)
            db.session.add(gs)

        db.session.commit()
        return jsonify({'status': 'saved', 'id': session.id})

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/get_history')
def get_history():
    module = request.args.get('module')
    limit  = int(request.args.get('limit', 30))
    q = Session.query
    if module:
        q = q.filter_by(module=module)
    sessions = q.order_by(Session.saved_at.desc()).limit(limit).all()
    return jsonify([s.to_dict() for s in reversed(sessions)])


@app.route('/api/clear_history', methods=['POST'])
def clear_history():
    try:
        Session.query.delete()
        PersonalRecord.query.delete()
        GameScore.query.delete()
        db.session.commit()
        return jsonify({'status': 'cleared'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/analytics')
def get_analytics():
    module = request.args.get('module')
    metric = request.args.get('metric')

    q = Session.query
    if module:
        q = q.filter_by(module=module)
    sessions = q.all()

    analytics = {
        'total_sessions': len(sessions),
        'total_time':     sum(s.duration for s in sessions),
        'modules_used':   len(set(s.module for s in sessions))
    }

    if module and metric:
        import json
        values = []
        for s in sessions:
            try:
                extra = json.loads(s.extra_json or '{}')
                if metric in extra and isinstance(extra[metric], (int, float)):
                    values.append(extra[metric])
                elif metric == 'score':
                    values.append(s.score)
            except Exception:
                pass
        if values:
            analytics[f'{metric}_avg'] = sum(values) / len(values)
            analytics[f'{metric}_max'] = max(values)
            analytics[f'{metric}_min'] = min(values)

    return jsonify(analytics)


@app.route('/api/leaderboard')
def get_leaderboard():
    game = request.args.get('game', 'all')
    q = GameScore.query
    if game != 'all':
        q = q.filter_by(game=game)
    scores = q.order_by(GameScore.score.desc()).limit(20).all()
    return jsonify([s.to_dict() for s in scores])


@app.route('/api/personal_records')
def get_personal_records():
    records = PersonalRecord.query.all()
    result = {}
    for r in records:
        result.setdefault(r.module, {})[r.metric] = r.value
    return jsonify(result)


@app.route('/api/export_session/<int:session_id>')
def export_session(session_id):
    import json
    session = db.session.get(Session, session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404

    d = session.to_dict()
    csv_data = 'Key,Value\n' + ''.join(f'"{k}","{v}"\n' for k, v in d.items())
    return csv_data, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': f'attachment; filename="session_{session_id}.csv"'
    }


@app.route('/api/system_info')
def system_info():
    import psutil
    return jsonify({
        'platform':        platform.system(),
        'processor':       platform.processor(),
        'cpu_percent':     psutil.cpu_percent(interval=0.5),
        'memory_percent':  psutil.virtual_memory().percent,
        'db_sessions':     Session.query.count(),
        'timestamp':       datetime.now().isoformat()
    })


@app.route('/api/mobile_stream')
def mobile_stream():
    """Proxy endpoint for mobile webcam (IP Webcam app)"""
    mobile_url = request.args.get('url')
    if not mobile_url:
        return jsonify({'error': 'No mobile URL provided'}), 400
    
    try:
        import requests
        response = requests.get(mobile_url, stream=True, timeout=5)
        return response.raw.read(), 200, {'Content-Type': 'image/jpeg'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── SocketIO ──────────────────────────────────────────────────────────

@socketio.on('connect')
def on_connect():
    emit('server_ready', {'backend': 'SQLite + AMD WebGL', 'time': datetime.now().isoformat()})

@socketio.on('ping_server')
def on_ping(data):
    emit('pong_server', {'latency': data.get('t', 0), 'server_time': time.time()})


# ── Helpers ───────────────────────────────────────────────────────────

def _upsert_record(module, metric, value):
    """Insert or update a personal record (keep the best value)."""
    existing = PersonalRecord.query.filter_by(module=module, metric=metric).first()
    # For reaction time lower is better; for everything else higher is better
    is_better = (not existing) or \
                (metric == 'reaction' and value < existing.value) or \
                (metric != 'reaction' and value > existing.value)
    if is_better:
        if existing:
            existing.value      = value
            existing.updated_at = datetime.utcnow()
        else:
            db.session.add(PersonalRecord(module=module, metric=metric, value=value))


# ── Entry point ───────────────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    
    max_attempts = 5
    for attempt in range(max_attempts):
        try:
            print("\n" + "="*50)
            print("  PoseAI Suite - SQLite Edition")
            print(f"  Starting on: http://127.0.0.1:{port}")
            print("  Database: data/poseai.db (SQLite)")
            print("  Press Ctrl+C to stop")
            print("="*50 + "\n")
            
            socketio.run(app, host='127.0.0.1', port=port, debug=False,
                         use_reloader=False, allow_unsafe_werkzeug=True)
            break
            
        except OSError as e:
            if 'address already in use' in str(e).lower() or e.errno == 10048:
                print(f"\n⚠️  Port {port} is in use. Trying {port+1}...")
                port += 1
                if attempt >= max_attempts - 1:
                    print("\n❌ Could not find available port.")
                    print("   Kill existing process:")
                    print(f"   netstat -ano | findstr :{port-1}")
                    print("   taskkill /PID <PID> /F\n")
            else:
                raise
