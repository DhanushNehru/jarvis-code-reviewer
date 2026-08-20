import os
from google.cloud import bigquery
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID")
DATASET_ID = "jarvis_reviewer"
TABLE_ID = "historical_rules"

client = bigquery.Client(project=PROJECT_ID)

def setup_bigquery():
    print(f"Setting up BigQuery in project {PROJECT_ID}...")

    # Create dataset
    dataset_ref = f"{PROJECT_ID}.{DATASET_ID}"
    dataset = bigquery.Dataset(dataset_ref)
    dataset.location = "US"
    
    try:
        dataset = client.create_dataset(dataset, timeout=30)
        print(f"Created dataset {client.project}.{dataset.dataset_id}")
    except Exception as e:
        if "Already Exists" in str(e):
            print(f"Dataset {DATASET_ID} already exists.")
        else:
            print(f"Failed to create dataset: {e}")
            raise

    # Load CSV to table
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"
    
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.CSV,
        skip_leading_rows=1,
        autodetect=True,
        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
    )

    csv_path = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "historical_rules.csv")
    
    with open(csv_path, "rb") as source_file:
        job = client.load_table_from_file(source_file, table_ref, job_config=job_config)

    job.result()  # Waits for the job to complete.

    table = client.get_table(table_ref)  # Make an API request.
    print(f"Loaded {table.num_rows} rows and {len(table.schema)} columns to {table_ref}")

if __name__ == "__main__":
    setup_bigquery()
