import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { getSDK, getSDKPure } from './remote/sdk';
import { ConfigService } from '@nestjs/config';
import { getFromConfigService } from './auth';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private configService: ConfigService,
  ) {}

  @Post('/auth/login')
  async authLogin(@Body() bodyParams: any): Promise<string> {
    // Validation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const email = bodyParams['email'];
    // TODO: Validate date
    if (typeof email !== 'string' || !email) {
      throw new BadRequestException("Param 'email' required");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const password = bodyParams['password'];
    // TODO: Validate date
    if (typeof password !== 'string' || !password) {
      throw new BadRequestException("Param 'password' required");
    }

    // Forward
    const { phpBaseUrl, phpApiKey } = getFromConfigService(this.configService);
    return getSDKPure(phpBaseUrl, phpApiKey, '', '')
      .authLogin(email, password)
      .then(JSON.stringify);
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

  @Post('/calendar-update')
  async updateCalendar(@Body() bodyParams: any): Promise<string> {
    // Validation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const calendarId = bodyParams['cid'];
    // TODO: Validate
    if (typeof calendarId !== 'string' || !calendarId) {
      throw new BadRequestException("Param 'cid' required");
    }
    const intCalendarId = parseInt(calendarId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const name = bodyParams['name'];
    let realName: undefined | string = undefined;
    if (typeof name === 'string' && !!name) {
      realName = name;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const color = bodyParams['color'];
    let realColor: undefined | string = undefined;
    // TODO: Validate
    if (typeof color === 'string' && !!color) {
      realColor = color;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const plannedColor = bodyParams['planned-color'];
    let realPlannedColor: undefined | string = undefined;
    // TODO: Validate
    if (typeof plannedColor === 'string' && !!plannedColor) {
      realPlannedColor = plannedColor;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const usesNotes = bodyParams['uses-notes'];
    let boolUsesNotes: undefined | boolean = undefined;
    // TODO: Validate
    if (usesNotes === 'true' || usesNotes === 'false') {
      boolUsesNotes = usesNotes === 'true';
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .updateCalendar(intCalendarId, {
        name: realName,
        color: realColor,
        plannedColor: realPlannedColor,
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

    // Forward
    return getSDK(this.configService, bodyParams)
      .readCalendarDate(calendarId, date)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date-create/:date')
  async createCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const notes = bodyParams['notes'];
    let realNotes: undefined | string = undefined;
    if (typeof notes === 'string' && !!notes) {
      realNotes = notes;
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .createCalendarDate(calendarId, date, realNotes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/date-upd-notes/:date')
  async updateCalendarDate(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const notes = bodyParams['notes'];
    let realNotes: undefined | string = undefined;
    if (typeof notes === 'string' && !!notes) {
      realNotes = notes;
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .updateCalendarDateNotes(calendarId, date, realNotes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-create/:date')
  async createTodo(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('date') date: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const notes = bodyParams['notes'];
    let realNotes: undefined | string = undefined;
    if (typeof notes === 'string' && !!notes) {
      realNotes = notes;
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .createPlannedEvent(calendarId, date, realNotes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-upd/:tid')
  async updateTodoNotes(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('tid') tid: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    const todoId = parseInt(tid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid tid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const notes = bodyParams['notes'];
    let realNotes: undefined | string = undefined;
    if (typeof notes === 'string' && !!notes) {
      realNotes = notes;
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .updatePlannedEvent(calendarId, todoId, realNotes)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-move/:tid')
  async moveTodo(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('tid') tid: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    const todoId = parseInt(tid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid tid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const date = bodyParams['date'];
    // TODO: Validate date
    if (typeof date !== 'string' || !date) {
      throw new BadRequestException("Param 'date' required");
    }

    // Forward
    return getSDK(this.configService, bodyParams)
      .movePlannedEvent(calendarId, todoId, date)
      .then(JSON.stringify);
  }

  @Post('/calendars/:cid/todo-done/:tid')
  async doneOrMissedTodo(
    @Body() bodyParams: any,
    @Param('cid') cid: string,
    @Param('tid') tid: string,
  ): Promise<string> {
    // Validation
    const calendarId = parseInt(cid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid cid ' + cid);
    }
    const todoId = parseInt(tid);
    if (Number.isNaN(calendarId)) {
      throw new NotFoundException('Invalid tid ' + cid);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const mode = bodyParams['mode'];
    // TODO: Validate date
    if (mode !== 'done' && mode !== 'missed') {
      throw new BadRequestException("Param 'mode' invalid");
    }
    if (mode === 'done') {
      // Validation
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const notes = bodyParams['notes'];
      let realNotes: undefined | string = undefined;
      if (typeof notes === 'string' && !!notes) {
        realNotes = notes;
      }

      // Forward
      return getSDK(this.configService, bodyParams)
        .setPlannedEventAsDone(calendarId, todoId, {
          type: 'done',
          notes: realNotes,
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
