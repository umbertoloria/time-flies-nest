export class ReadUserStatusDto {
  constructor(
    //
    public readonly user: ReqUser,
  ) {}

  static fromBody(user: ReqUser) {
    return new ReadUserStatusDto(
      //
      user,
    );
  }
}
