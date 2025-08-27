import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { getSDK } from './remote/sdk';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Post('/calendars/:cid')
  async readCalendarById(
    @Param('cid') cid: string,
    @Body() bodyParams: any,
  ): Promise<string> {
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { em, sp } = bodyParams;
    if (!(typeof em === 'string' && !!em && typeof sp === 'string' && !!sp)) {
      throw new UnauthorizedException();
    }
    const phpBaseUrl = this.configService.get<string>('PHP_BASE_URL');
    const phpApiKey = this.configService.get<string>('PHP_API_KEY');
    const responseText = await getSDK(
      phpBaseUrl,
      phpApiKey,
      em,
      sp,
    ).readCalendarByID(calendarId);
    // console.log(responseText);
    return JSON.stringify(responseText);
  }
}
