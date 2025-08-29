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

  @Post('/calendars')
  async readCalendars(@Body() bodyParams: any): Promise<string> {
    // Validation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const dateFrom = bodyParams['date-from'];
    // TODO: Improve date validation
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
}
