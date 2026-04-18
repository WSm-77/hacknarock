from fastapi import APIRouter

# Tworzymy router dedykowany tylko dla spotkań
router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"]
)

@router.post("/")
async def create_meeting():
    return {"message": "Tutaj organizator zainicjuje spotkanie"}

@router.post("/{meeting_id}/vote")
async def submit_vote(meeting_id: str):
    return {"message": f"Tutaj znajomi oddadzą głos na spotkanie {meeting_id}"}