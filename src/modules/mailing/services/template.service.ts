import { Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly templates: Map<string, handlebars.TemplateDelegate> =
    new Map();

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templatesDir = path.join(process.cwd(), 'templates', 'mailing');

    try {
      const files = fs.readdirSync(templatesDir);

      for (const file of files) {
        if (file.endsWith('.html')) {
          const templateName = path.basename(file, '.html');
          const templatePath = path.join(templatesDir, file);
          const templateContent = fs.readFileSync(templatePath, 'utf8');

          this.templates.set(templateName, handlebars.compile(templateContent));
          this.logger.log(
            `Loaded template: ${templateName}`,
            TemplateService.name,
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error loading templates: ${errorMessage}`,
        TemplateService.name,
      );
      throw error;
    }
  }

  render(templateName: string, context: Record<string, any>): string {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    try {
      return template(context);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error rendering template ${templateName}: ${errorMessage}`,
        TemplateService.name,
      );
      throw error;
    }
  }
}
