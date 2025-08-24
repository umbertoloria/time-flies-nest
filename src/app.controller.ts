import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { getSDK } from './remote/sdk';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/calendars/:cid')
  async readCalendarById(@Param('cid') cid: string): Promise<string> {
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }

    const phpBaseUrl = this.configService.get<string>('PHP_BASE_URL');
    const phpApiKey = this.configService.get<string>('PHP_API_KEY');
    const responseText = await getSDK(phpBaseUrl, phpApiKey).readCalendarByID(
      calendarId,
    );
    // console.log(responseText);
    return JSON.stringify(responseText);
  }
}
