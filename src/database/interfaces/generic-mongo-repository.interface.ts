import {
  Aggregate,
  AggregateOptions,
  FilterQuery,
  PipelineStage,
  ProjectionType,
  QueryOptions,
} from 'mongoose';

export interface IGenericMongoRepository<Model, ModelDocument> {
  find?(
    filters?: FilterQuery<Model>,
    projection?: ProjectionType<Model>,
    options?: QueryOptions<Model>,
  ): Promise<ModelDocument[]>;

  findOne(
    filters: FilterQuery<Model>,
    projection?: ProjectionType<Model>,
    options?: QueryOptions<Model>,
  ): Promise<ModelDocument | null>;

  save(
    document: ModelDocument,
    options?: QueryOptions<Model>,
  ): Promise<ModelDocument>;

  aggregate?(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
  ): Promise<Aggregate<any[]>>;

  deleteOne?(
    filter: FilterQuery<Model>,
    options?: QueryOptions<Model>,
  ): Promise<boolean>;
}
