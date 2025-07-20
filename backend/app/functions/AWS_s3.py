from dotenv import load_dotenv
import os
import boto3


load_dotenv()

BUCKET_NAME = os.environ.get('BUCKET_NAME')

from urllib.parse import urlparse


s3 = boto3.client(
    "s3",
    region_name="us-east-1",  # change this to your S3 region
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_KEY"),
)

def extract_s3_key(s3_url: str) -> str:
    parsed = urlparse(s3_url)
    print("parsed values: ", parsed)
    # parsed.path is like '/pfps/58b59edcb9034a9db9a488185f56d5af_pixil-frame-0.png'
    return parsed.path.lstrip('/')  # Remove leading slash


def get_presigned_url(profile_url: str) -> str:
    
    presigned_url = s3.generate_presigned_url(
    ClientMethod="get_object",
    Params={
        "Bucket": BUCKET_NAME,
        "Key": extract_s3_key(profile_url)
    },
    ExpiresIn=3600  # seconds = 1 hour

   
    )

    print("pre signed url: ", presigned_url)
    
    return  presigned_url