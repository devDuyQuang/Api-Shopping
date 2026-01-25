// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { SiteService } from './site.service';


// @Controller('site')
// export class SiteController {
//   constructor(private readonly siteService: SiteService) { }

//   @Get("new-arrivals")
//   newArrivals() {
//     return this.siteService.newArrivals();
//   }
// }
import { Controller, Get, Param } from '@nestjs/common';
import { SiteService } from './site.service';
import { CategoryService } from 'src/category/category.service';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) { }

  @Get("new-arrivals")
  newArrivals() {
    return this.siteService.newArrivals();
  }

  // ✅ câu 1: get list category - public
  @Get("categories")
  getCategories() {
    return this.siteService.getCategories();
  }

  // ✅ (2) detail category by slug - public
  @Get('categories/:slug')
  categoryBySlug(@Param('slug') slug: string) {
    return this.siteService.categoryBySlug(slug);
  }
}
