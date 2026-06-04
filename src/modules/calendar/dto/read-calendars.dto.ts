import {
  fromBodyGetOptionalBool,
  fromBodyGetRequiredLocalDate,
} from '../../../lib/validate';

export class ReadCalendarsDto {
  constructor(
    public readonly dateFrom: string,
    public readonly showAll: boolean,
    public readonly user: ReqUser,
  ) {}

  static fromBody(body: any, user: ReqUser) {
    // Validation
    const dateFrom = fromBodyGetRequiredLocalDate(body, 'date-from');
    const showAll = fromBodyGetOptionalBool(body, 'show-all') || false;

    return new ReadCalendarsDto(
      //
      dateFrom,
      showAll,
      user,
    );
  }
}
