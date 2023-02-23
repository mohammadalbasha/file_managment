
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, TypeOrmHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get('/http')
  @HealthCheck()
  checkHttp() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @Get('/database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('/disk')
  @HealthCheck()
  checkDisk() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: 'D:\\Nest Projects\\enterprise_architecture\\uploads', thresholdPercent: 0.5 }),
    ]);
  }

  
  @Get('/diskNegative')
  @HealthCheck()
  checkDiskNegative() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: 'F:\\', thresholdPercent: 0.5 }),
    ]);
  }

}
