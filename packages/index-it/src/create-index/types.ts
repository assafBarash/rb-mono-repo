import { Project } from 'ts-morph';

export type IndexItConfiguration = {
  alias?: 'camel' | 'kebab' | 'pascal' | 'snake';
  noTypes?: boolean;
  paths: string[];
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
