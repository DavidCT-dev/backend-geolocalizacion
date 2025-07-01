import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DecodedTokenDto, LoginAuthDto } from './dto/create-auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginAuthDto })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.singin(loginAuthDto);
  }

  @Post('decoded')
  decoded(@Body() token: DecodedTokenDto) {
    return this.authService.decoded(token);
  }


  @Post('register-mobile')
  @ApiBody({ type: LoginAuthDto })
  async registerMobile(@Body() registerMobileAuthDto: any) {
    return this.authService.registerMobile(registerMobileAuthDto);
  }

  @Post('login-mobile')
  @ApiBody({ type: LoginAuthDto })
  async loginMobile(@Body() loginMobileAuthDto: any) {
    return this.authService.loginMobile(loginMobileAuthDto);
  }
  

}
