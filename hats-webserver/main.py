from flask import Flask, jsonify, request
from nested_pandas import NestedDtype
import pandas as pd
from flask_cors import CORS
import threading
import lsdb

class DataFrameSingleton:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, file_path="data.parquet"):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DataFrameSingleton, cls).__new__(cls)
                cls._instance.cat = lsdb.read_hats("/sdf/data/rubin/shared/lsdb_commissioning/sean_test/webviewer_cat/cat", columns=["objectId","i_ra","i_dec","u_cModelFlux","u_cModelFluxErr","g_cModelFlux","g_cModelFluxErr","r_cModelFlux","r_cModelFluxErr","i_cModelFlux","i_cModelFluxErr","z_cModelFlux","z_cModelFluxErr","y_cModelFlux","y_cModelFluxErr","u_cModelMag","u_cModelMagErr","g_cModelMag","g_cModelMagErr","r_cModelMag","r_cModelMagErr","i_cModelMag","i_cModelMagErr","z_cModelMag","z_cModelMagErr","y_cModelMag","y_cModelMagErr","ebv","zmedian","zmode","zmean"])
                cls._instance.lc_cat = lsdb.read_hats("/sdf/data/rubin/shared/lsdb_commissioning/sean_test/webviewer_cat/cat", columns=["i_ra", "i_dec", "objectId", "objectForcedSource_w11"])
        return cls._instance
    
    def get_filtered_json(self, ra_min, ra_max, dec_min, dec_max, zmode_min, zmode_max):
        df = self.cat.box_search([ra_min, ra_max], [dec_min, dec_max]).query(f"zmode >= {zmode_min} and zmode < {zmode_max}").head(50)
        return df.to_json(orient='records')

    def get_light_curve(self, ra, dec, objid):
        df = self.lc_cat.cone_search(ra, dec, 10).query(f"objectId=={objid}").compute()
        lc_df = df["objectForcedSource_w11"].astype(NestedDtype.from_pandas_arrow_dtype(df.dtypes["objectForcedSource_w11"])).iloc[0]
        return lc_df.to_json(orient='records')

app = Flask(__name__)
CORS(app)
df_singleton = DataFrameSingleton()

@app.route('/data', methods=['GET'])
def get_data():
    try:
        ra_min = float(request.args.get('raMin', float('-inf')))
        ra_max = float(request.args.get('raMax', float('inf')))
        dec_min = float(request.args.get('decMin', float('-inf')))
        dec_max = float(request.args.get('decMax', float('inf')))
        zmode_min = float(request.args.get('zMin', 0))
        zmode_max = float(request.args.get('zMax', 4))
        
        return jsonify(df_singleton.get_filtered_json(ra_min, ra_max, dec_min, dec_max, zmode_min, zmode_max))
    except ValueError:
        return jsonify({"error": "Invalid parameter values"}), 400

@app.route("/lc", methods=["GET"])
def get_lightcurve_data():
    try:
        ra = float(request.args.get("ra", float("-inf")))
        dec = float(request.args.get("dec", float("inf")))
        objid = float(request.args.get("objid", -1))

        return jsonify(df_singleton.get_light_curve(ra, dec, objid))
    except ValueError:
        return jsonify({"error": "Invalid parameter values"}), 400

if __name__ == '__main__':
    print("starting")
    app.run(host="0.0.0.0", port=5000, debug=True)
