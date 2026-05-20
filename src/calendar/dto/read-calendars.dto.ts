import { get_optional_bool, get_required_local_date } from '../../lib/validate';

export class ReadCalendarsDto {
  constructor(
    public readonly dateFrom: string,
    public readonly showAll: boolean,
    public readonly user: ReqUser,
  ) {}

  static fromBody(body: any, user: ReqUser) {
    // Validation
    const dateFrom = get_required_local_date(body, 'date-from');
    const showAll = get_optional_bool(body, 'show-all') || false;

    return new ReadCalendarsDto(
      //
      dateFrom,
      showAll,
      user,
    );
  }
}
