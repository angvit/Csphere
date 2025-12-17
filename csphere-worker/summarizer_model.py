from pydantic import BaseModel



class SummarizerModel(BaseModel):
    categories: list[str]
    summary: str