import { Project } from 'ts-morph';

export type IndexItConfiguration = {
  paths: string[];
  alias?: 'camel' | 'kebab' | 'pascal' | 'snake';
  exportFile?: string;
  noTypes?: boolean;
};

export type DirHandlerConfig = Omit<IndexItConfiguration, 'paths'> & {
  morph: Project;
};

export type FileExportData = {
  typeExports: string[];
  variableExports: string[];
  file: string;
};

export type IAlias = Pick<IndexItConfiguration, 'alias'>;
