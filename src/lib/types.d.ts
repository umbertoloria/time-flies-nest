interface Request {
  currUser?: ReqUser;
}

interface ReqUser {
  id: string;
  email: string;
}
