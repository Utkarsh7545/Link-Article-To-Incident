import { OperationFactory } from '../../operations';
import { ExecuteOperationInput, FunctionInput, OperationMap } from '@devrev/typescript-sdk/dist/snap-ins';
import { LinkArticlesToIncident } from './link_articles_to_incident';

const operationMap: OperationMap = {
  link_articles_to_incident: LinkArticlesToIncident,
};

export const run = async (events: FunctionInput[]) => {
  const event = events[0];
  const payload = event.payload as ExecuteOperationInput;
  const operationSlug = payload.metadata!.slug;
  const operationNamespace = payload.metadata!.namespace;

  console.log('running operation: ', operationSlug, ' in namespace: ', operationNamespace, ' event: ', event);

  const operationFactory = new OperationFactory(operationMap);
  const operation = operationFactory.getOperation(operationSlug, event);
  const ctx = operation.GetContext(event);
  const resources = event.input_data.resources || {};

  return await operation.run(ctx, payload, resources);
};

export default run;
