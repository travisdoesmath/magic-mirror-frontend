from flask import Flask, render_template
import requests

app = Flask(__name__)

base_url = 'https://us-central1-magic-mirror-api-370220.cloudfunctions.net'
lat=30.443792093856636
lon=-97.77286847276932

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/weather')
def weather():
    response = requests.get(f'{base_url}/get-weather?lat={lat}&lon={lon}')
    return response.content

@app.route('/news')
def news():
    response = requests.get(f'{base_url}/get-news')
    return response.content

@app.route('/pollen')
def pollen():
    response = requests.get(f'{base_url}/get-pollen')
    return response.content

if __name__ == '__main__':
    app.run(debug=True, port=5050)