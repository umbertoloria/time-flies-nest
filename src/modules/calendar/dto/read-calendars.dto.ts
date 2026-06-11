import { validateDate } from '@core/lib/validate';
import { ReadCalendarsGdto } from '@gateway/calendar/gdto';

export class ReadCalendarsDto {
  constructor(
    public readonly dateFrom: string,
    public readonly showAll: boolean,
    public readonly user: ReqUser,
  ) {}

  static fromGateway(gdto: ReadCalendarsGdto, user: ReqUser) {
    const dateFrom = validateDate(
      gdto.dateFrom,
      'Param "dateFrom" invalid: must be a date',
    );
    const showAll = gdto.showAll || false;

    return new ReadCalendarsDto(dateFrom, showAll, user);
  }
}
