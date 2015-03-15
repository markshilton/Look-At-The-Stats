import pandas as pd
import numpy as np
import json
import datetime
import time
import codecs

def parse_time(raw_time):
    '''Parse the raw time strings into timedeltas for doing arithmetic on the times'''
    if raw_time == '' or None:
        return None
    else:
        try:
            dt = datetime.datetime.strptime(raw_time, '%M:%S.%f')
            timedelta = datetime.timedelta(minutes=dt.minute, seconds=dt.second, microseconds=dt.microsecond)
            return timedelta
        except:
            dt = datetime.datetime.strptime(raw_time, '%S.%f')
            timedelta = datetime.timedelta(seconds=dt.second, microseconds=dt.microsecond)
            return timedelta


def timedeltaToString(rawTd):
    '''Convert timedelta to a MM:SS.000 formatted string'''
    try:
        dt = pd.to_datetime(rawTd)
        dt = datetime.datetime.strftime(dt, '%M:%S.%f')[:-3] #Returns time down to nanoseconds. This just strips off the last three zeros
        return dt
    except:
        return None

def processResults(df):
    '''Calculate split times, time gaps and rankings for each rider'''
    #Apply the time parser to the raw times
    for i in range(1,4):
        df['sector' + str(i)] = df['sector' + str(i)].apply(parse_time)

    #Calculate the total split times for each split
    df['split1'] = df['sector1']
    df['split2'] = df['sector1'] + df['sector2']
    df['split3'] = df['split2'] + df['sector3']
    df.head()

    #Calculate the time gaps and rankings for everything
    cols = ['sector1', 'sector2', 'sector3', 'split1', 'split2', 'split3']

    for col in cols:
        df[col + 'Gap'] = df[col].apply(lambda x: (x - df[col].min())/np.timedelta64(1,'s'))
        df[col + 'Rank'] = df[col].rank()
        df[col] = df[col].apply(timedeltaToString)

    return df.to_dict(outtype='records')
    
with open('seasonData.json', 'r', encoding='utf-8') as jsonFile:
    seasonData = json.load(jsonFile)

    for race in range(0,len(seasonData)):
        for cat in range(0,2):
            print('processing ' + str(seasonData[race]) + ' ' + str(seasonData[race]['results'][cat]['category']))
            df = pd.DataFrame.from_dict(seasonData[race]['results'][cat]['categoryResults'])
            processedResults = processResults(df)
            seasonData[race]['results'][cat]['categoryResults'] = processedResults

with open('seasonData_processed.json', 'w', encoding='utf-8') as outfile:
    json.dump(seasonData, outfile)

print('Processing complete!')



