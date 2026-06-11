export class ReadStreamlineDto {
  constructor(
    //
    public readonly user: ReqUser,
  ) {}

  static fromBody(user: ReqUser) {
    return new ReadStreamlineDto(
      //
      user,
    );
  }
}
