# Run with
# export FLASK_APP=./tracker.py && flask run

from flask import Flask, jsonify
from flask import jsonify
import requests
import pandas
import json
import math
import datetime

LODGE_DATE = datetime.datetime.strptime('2018-04-05', "%Y-%m-%d")

app = Flask(__name__)


def normcdf(x, mu, sigma):
    return 0.5*(1+math.erf((x-mu)/(sigma*math.sqrt(2.0))));


def query_data():
    url = 'https://myimmitracker.com/au/trackers/sc189-visa-tracker-2017-2018/cases'
    headers = {
        'pragma': 'no-cache',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,af;q=0.8',
        'accept': 'application/json;charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
    }
    res_length = 100
    c = 0
    data = []
    while res_length == 100:
        params = {
            'start': c * 100,
        }
        res = requests.get(url, headers=headers, params=params)
        data = data + res.json()['values']
        res_length = len(res.json()['values'])
        c = c + 1

    df = pandas.DataFrame(data)
    old_columns = ['xomov-gaver-pusis-lutud-mebon-vidil-boror-lyzat-vexox',
                   'xohiv-licym-babal-rozor-piser-girec-suzis-zemil-cexex']
    new_columns = ['start_date',
                   'grant_date']
    df = df[old_columns]
    df.columns = new_columns
    df.grant_date = pandas.to_datetime(df.grant_date)
    df.start_date = pandas.to_datetime(df.start_date)
    df = df.sort_values('grant_date')
    return df

def format_case_dict(case):
    case['negative_index'] =  (datetime.datetime.now() - case['grant_date']).days
    case['grant_date'] = str(case['grant_date'])[:10]
    case['start_date'] = str(case['start_date'])[:10]
    return case


@app.route("/visa", methods=['GET'])
def get_data():
    df = query_data()
    df = df.dropna()
    df['days_to_grant'] = df['grant_date'] - df['start_date']
    df['days_to_grant'] = df['days_to_grant'].apply(lambda x: x.days)
    df['rolling_mean_10'] = df['days_to_grant'].rolling(window=10).mean()
    df['rolling_mean_50'] = df['days_to_grant'].rolling(window=50).mean()
    df = df.iloc[50:, :]

    n = 200
    samples = df.sort_values('grant_date')['days_to_grant'].values[-n:]
    mean = sum(samples) / n
    sigma = math.sqrt(sum((samples - mean) ** 2) / n)

    dates = [(datetime.datetime.now() + datetime.timedelta(days=x)) for x in range(250)]
    days = [(x - LODGE_DATE).days for x in dates]
    probabilities = [normcdf(day, mean, sigma) for day in days]

    distribution = {
        'mu': mean,
        'sigma': sigma,
        'data_range': {
            'samples': n,
            'start_date': str(df.sort_values('grant_date')['grant_date'].values[-n])[:10],
            'end_date': str(df.sort_values('grant_date')['grant_date'].values[-1])[:10],
        },
        'cdf': {
            'values': [p*100 for p in probabilities],
            'dates': [str(date)[:10] for date in dates]
        }
    }

    cases = df.to_dict(orient='records')
    cases = [format_case_dict(case) for case in cases]

    data = {
        'cases': cases,
        'distribution': distribution,
        'expected_date': str(LODGE_DATE + datetime.timedelta(days=int(df['rolling_mean_50'].values[-1])))[:10],
        'last_grant_date': str(df['grant_date'].values[-1])[:10],
        'last_lodge_date_granted': str(df.sort_values('start_date')['start_date'].values[-1])[:10]
    }

    return jsonify(data)


