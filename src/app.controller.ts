import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import { getSDK, getSDKPure } from './remote/sdk';
import { ConfigService } from '@nestjs/config';
import { getFromConfigService } from './auth';
import {
  get_optional_bool,
  get_optional_color,
  get_optional_string,
  get_required_bool,
  get_required_color,
  get_required_int,
  get_required_local_date,
  get_required_string,
  validate_date,
  validate_int,
} from './lib/validate';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Post('/auth/login')
  async authLogin(@Body() bodyParams: any): Promise<string> {
    // Validation
    const email = get_required_string(bodyParams, 'email');
    const password = get_required_string(bodyParams, 'password');

    // Forward
    const { phpBaseUrl, phpApiKey } = getFromConfigService(this.configService);
    return getSDKPure(phpBaseUrl, phpApiKey, '', '')
      .authLogin(email, password)
      .then(() => 'ok-login');
  }

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
    const dateFrom = get_required_local_date(bodyParams, 'date-from');
    const showAll = get_optional_bool(bodyParams, 'show-all') || false;

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
    @Param('cid') urlCid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');

    // Forward
    return getSDK(this.configService, bodyParams)
      .readCalendarByID(calendarId)
      .then(JSON.stringify);
  }

  @Post('/calendars-create')
  async createCalendar(@Body() bodyParams: any): Promise<string> {
    // Validation
    const name = get_required_string(bodyParams, 'name');
    const color = get_required_color(bodyParams, 'color');
    const plannedColor = get_required_color(bodyParams, 'planned-color');
    const usesNotes = get_required_bool(bodyParams, 'uses-notes');

    // Forward
    return getSDK(this.configService, bodyParams)
      .createCalendar({
        name,
        color,
        plannedColor,
        usesNotes,
      })
      .then(JSON.stringify);
  }

  @Post('/calendar-update')
  async updateCalendar(@Body() bodyParams: any): Promise<string> {
    // Validation
    const calendarId = get_required_int(bodyParams, 'cid');
    const name = get_optional_string(bodyParams, 'name');
    const color = get_optional_color(bodyParams, 'color');
    const plannedColor = get_optional_color(bodyParams, 'planned-color');
    const usesNotes = get_optional_bool(bodyParams, 'uses-notes');

    // Forward
    return getSDK(this.configService, bodyParams)
      .updateCalendar(calendarId, {
        name: name,
        color,
        plannedColor,
        usesNotes,
      })
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date/:date')
  async readCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');

    // Forward
    return getSDK(this.configService, bodyParams)
      .readCalendarDate(calendarId, date)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date-create/:date')
  async createCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') urlDate: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const date = validate_date(urlDate, 'Invalid Date');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return getSDK(this.configService, bodyParams)
      .createCalendarDate(calendarId, date, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date-upd-notes/:date')
  async updateCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return getSDK(this.configService, bodyParams)
      .updateCalendarDateNotes(calendarId, date, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-create/:date')
  async createTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    // TODO: Validate "date"
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return getSDK(this.configService, bodyParams)
      .createPlannedEvent(calendarId, date, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-upd/:tid')
  async updateTodoNotes(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const notes = get_optional_string(bodyParams, 'notes');

    // Forward
    return getSDK(this.configService, bodyParams)
      .updatePlannedEvent(calendarId, todoId, notes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-move/:tid')
  async moveTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const date = get_required_local_date(bodyParams, 'date');

    // Forward
    return getSDK(this.configService, bodyParams)
      .movePlannedEvent(calendarId, todoId, date)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-done/:tid')
  async doneOrMissedTodo(
    @Body() bodyParams: any,
    @Param('cid') urlCid: string,
    @Param('tid') urlTid: string,
  ): Promise<string> {
    // Validation
    const calendarId = validate_int(urlCid, 'Invalid CalendarID');
    const todoId = validate_int(urlTid, 'Invalid TodoID');
    const mode = get_required_string(bodyParams, 'mode');
    if (mode === 'done') {
      // Validation
      const notes = get_optional_string(bodyParams, 'notes');

      // Forward
      return getSDK(this.configService, bodyParams)
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'done',
          notes,
        })
        .then(JSON.stringify);
    } else if (mode === 'missed') {
      // Forward
      return getSDK(this.configService, bodyParams)
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'missed',
        })
        .then(JSON.stringify);
    } else {
      // Should never happen.
      throw new BadRequestException("Param 'mode' invalid");
    }
  }
}
