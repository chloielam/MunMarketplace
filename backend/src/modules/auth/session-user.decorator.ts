import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

interface SessionUserOptions {
  optional?: boolean;
}

export const SessionUserId = createParamDecorator(
  (options: SessionUserOptions | undefined, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userId = request.session?.userId;

    if (!userId && !(options?.optional)) {
      throw new UnauthorizedException('Not authenticated');
    }

    return userId;
  },
);
