interface Request {
  currUser?: ReqUser;
}

interface ReqUser {
  id: number;
  email: string;
}
