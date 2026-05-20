import { get_required_string } from '../../../lib/validate';

export class UserLoginDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}

  static fromBody(body: any) {
    // Validation
    const email = get_required_string(body, 'email');
    const password = get_required_string(body, 'password');

    return new UserLoginDto(
      //
      email,
      password,
    );
  }

  static fromApiAuth(apiAuth: { em: string; sp: string }) {
    const { em, sp } = apiAuth;

    return new UserLoginDto(
      //
      em,
      sp,
    );
  }
}
