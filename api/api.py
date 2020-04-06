from flask import Flask, abort, Response
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

from datetime import datetime
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from glob import glob
from slugify import slugify

app = Flask(__name__)
api = Api(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///music.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(), unique=True)
    number = db.Column(db.Integer)
    title = db.Column(db.String())
    artist = db.Column(db.String())
    album = db.Column(db.String())
    duration = db.Column(db.Integer)
    path = db.Column(db.String)
    created = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, *args, **kwargs):
        if not 'slug' in kwargs:
            slug_data = []
            for field in ['number', 'artist', 'album', 'title']:
                data = kwargs.get(field, None)
                if data:
                    slug_data.append(str(data))
            kwargs['slug'] = slugify('-'.join(slug_data))
        super().__init__(*args, **kwargs)

class SongSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Song
        fields = ('slug', 'number', 'title', 'artist', 'album', 'duration', 'created', 'url', 'album_art')

    url = ma.URLFor("songfile", slug="<slug>")
    album_art = ma.URLFor("songart", slug="<slug>")


db.create_all()

for song in glob('music/**/*.mp3', recursive=True):
    duration = int(MP3(song).info.length)
    m = EasyID3(song)
    s = Song( 
        number=int(m['tracknumber'][0]), 
        title=m['title'][0], 
        artist=m['artist'][0], 
        album=m['album'][0], 
        path=song,
        duration=duration,
    )
    instance = Song.query.filter_by(slug=s.slug).first()
    if not instance:
        db.session.add(s)

db.session.commit()
    

class SongMeta(Resource):
    def get(self, *args, **kwargs):
        schema = SongSchema(many=True)
        return schema.dump(Song.query.all())

class FileResource(Resource):
    representations = { '*/*': lambda data: data }

class SongFile(FileResource):
    def get(self, *args, **kwargs):
        song = Song.query.filter_by(slug=kwargs.get('slug', None)).first()
        if song:
            with open(song.path, 'rb') as mp3_file:
                resp = Response(mp3_file.read())
                # Accept Ranges header is required for the client to seek on Chrome
                resp.headers['Accept-Ranges'] = 'bytes'
                return resp
        else:
            abort(404)

class SongArt(FileResource):
    def get(self, *args, **kwargs):
        song = Song.query.filter_by(slug=kwargs.get('slug', None)).first()
        if song:
            album_art = MP3(song.path).tags.getall('APIC')
            return Response(album_art[0].data)
        else:
            abort(404)



api.add_resource(SongMeta, '/api/song/meta/', '/api/song/meta/<slug>')
api.add_resource(SongFile, '/api/song/<slug>')
api.add_resource(SongArt, '/api/song/art/<slug>')

if __name__ == '__main__':
    app.run(debug=True)
