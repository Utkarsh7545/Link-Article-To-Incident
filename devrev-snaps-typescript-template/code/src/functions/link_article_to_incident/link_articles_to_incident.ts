import { Error as OperationError, Error_Type, ExecuteOperationInput, FunctionInput, OperationBase, OperationContext, OperationOutput, OutputValue } from '@devrev/typescript-sdk/dist/snap-ins';
import { postCall } from '../utils';

const CREATE_LINK = '/internal/links.create';

interface LinkArticlesToIncidentInput {
  incident_id: string;
  article_id: string;
}

export class LinkArticlesToIncident extends OperationBase {
  constructor(e: FunctionInput) {
    super(e);
  }

  async run(context: OperationContext, input: ExecuteOperationInput, _resources: any): Promise<OperationOutput> {
    const input_data = input.data as LinkArticlesToIncidentInput;
    const incidentId = input_data.incident_id;
    const articleId = input_data.article_id;

    let err: OperationError | undefined = undefined;

    if (!incidentId || !articleId) {
      err = {
        message: 'Both incident_id and article_id are required.',
        type: Error_Type.InvalidRequest,
      };
      return OperationOutput.fromJSON({ error: err });
    }

    const endpoint = context.devrev_endpoint;
    const token = context.secrets.access_token;

    const linkPayload = {
      link_type: 'is_related_to',
      source: incidentId,
      target: articleId,
    };

    try {
      const response = await postCall(endpoint + CREATE_LINK, token, linkPayload);
      if (!response.success) {
        throw new Error('API call failed');
      }

      return OperationOutput.fromJSON({
        output: {
          values: [{ message: `Article ${articleId} successfully linked to incident ${incidentId}` }],
        } as OutputValue,
      });
    } catch (e: any) {
      err = {
        message: 'Error while linking article: ' + e.message,
        type: Error_Type.InvalidRequest,
      };
      return OperationOutput.fromJSON({ error: err });
    }
  }
}
