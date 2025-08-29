import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { getSDK } from './remote/sdk';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Post('/auth/status')
  async authStatus(@Body() bodyParams: any): Promise<string> {
    // Forward
    return getSDK(this.configService, bodyParams)
      .readAuthStatus()
      .then(JSON.stringify);
  }

  @Post('/streamline')
  async streamlineRead(@Body() bodyParams: any): Promise<string> {
    // Forward
    return getSDK(this.configService, bodyParams)
      .readStreamline()
      .then(JSON.stringify);
  }

  @Post('/calendars')
  async readCalendars(@Body() bodyParams: any): Promise<string> {
    // Validation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const dateFrom = bodyParams['date-from'];
    // TODO: Validate date
    if (typeof dateFrom !== 'string' || !dateFrom) {
      throw new BadRequestException("Param 'date-from' required");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const showAll = bodyParams['show-all'] === 'true';

    // Forward
    return getSDK(this.configService, bodyParams)
      .readCalendars({
        dateFrom,
        seeAllCalendars: showAll,
      })
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid')
  async readCalendarById(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .readCalendarByID(calendarId)
      .then(JSON.stringify);
  }

  @Post('/calendars-create')
  async createCalendar(@Body() bodyParams: any): Promise<string> {
    // Validation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const name = bodyParams['name'];
    // TODO: Validate
    if (typeof name !== 'string' || !name) {
      throw new BadRequestException("Param 'name' required");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const color = bodyParams['color'];
    // TODO: Validate
    if (typeof color !== 'string' || !color) {
      throw new BadRequestException("Param 'color' required");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const plannedColor = bodyParams['planned-color'];
    // TODO: Validate
    if (typeof plannedColor !== 'string' || !plannedColor) {
      throw new BadRequestException("Param 'planned-color' required");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const usesNotes = bodyParams['uses-notes'];
    // TODO: Validate
    if (usesNotes !== 'true' && usesNotes !== 'false') {
      throw new BadRequestException("Param 'uses-notes' required");
    }
    const boolUsesNotes = usesNotes === 'true';

    // Forward
    return getSDK(this.configService, bodyParams)
      .createCalendar({
        name,
        color,
        plannedColor,
        usesNotes: boolUsesNotes,
      })
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date/:date')
  async readCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    // TODO: Validate date

    // Forward
    return getSDK(this.configService, bodyParams)
      .readCalendarDate(calendarId, date)
      .then(JSON.stringify);
  }
}
