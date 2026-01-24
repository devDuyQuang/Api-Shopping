import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SiteService } from './site.service';


@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) { }

  @Get("new-arrivals")
  newArrivals() {
    return this.siteService.newArrivals();
  }
}
