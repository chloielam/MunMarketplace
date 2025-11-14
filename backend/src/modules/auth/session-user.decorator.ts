import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Session } from 'express-session';

interface SessionUserOptions {
  optional?: boolean;
}

interface ExtendedSessionData extends SessionData {
  userId?: string;
}

export const SessionUserId = createParamDecorator(
  (
    options: SessionUserOptions | undefined,
    ctx: ExecutionContext,
  ): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const session = request.session as (Session & { userId?: string }) | undefined;
    const userId = session?.userId;

    if (!userId && !options?.optional) {
      throw new UnauthorizedException('Not authenticated');
    }

    return userId;
  },
);
