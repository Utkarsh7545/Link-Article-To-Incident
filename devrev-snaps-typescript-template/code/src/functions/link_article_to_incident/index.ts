import { postCall } from '../utils';

const CORE_SEARCH = '/internal/search.core';
const CREATE_LINK = '/internal/links.create';
const CREATE_COMMENT = '/internal/timeline-entries.create';

const linkMostRelevantArticle = async (event: any): Promise<void> => {
  const endpoint = event.execution_metadata.devrev_endpoint;
  const token = event.context.secrets.service_account_token;
  const incident = event.payload?.incident_created?.incident;
  console.log('incident', incident);

  if (!incident || !incident.id || !incident.title) {
    console.error('Missing incident data');
    return;
  }

  const incidentId = incident.id;
  const query = `${incident.title} ${incident.body || ''}`.trim();

  // 1. Search for most relevant article
  const searchPayload = {
    query,
    namespaces: ['article'],
    limit: 1,
  };

  const searchRes = await postCall(endpoint + CORE_SEARCH, token, searchPayload);
  if (!searchRes.success || !searchRes.data?.results?.length) {
    console.log(`No articles found for incident: ${incidentId}`);
    return;
  }

  const article = searchRes.data.results[0].article;
  const articleId = article.id;
  const articleTitle = article.title;
  const articleDisplayId = article.display_id;

  // 2. Link the article to the incident
  const linkPayload = {
    link_type: 'is_related_to',
    source: incidentId,
    target: articleId,
  };

  const linkRes = await postCall(endpoint + CREATE_LINK, token, linkPayload);
  if (!linkRes.success) {
    console.error(`Failed to link article ${articleId} to incident ${incidentId}`);
    return;
  }

  console.log(`Linked article ${articleId} to incident ${incidentId}`);

  // 3. Add comment to incident
  const commentPayload = {
    type: 'timeline_comment',
    object: incidentId,
    body: `Linked Article:\n- **${articleTitle}** (${articleDisplayId})`,
  };

  const commentRes = await postCall(endpoint + CREATE_COMMENT, token, commentPayload);
  if (!commentRes.success) {
    console.error(`Failed to add comment on incident ${incidentId}`);
  }
};

// Entrypoint
export const run = async (events: any[]) => {
  for (const event of events) {
    console.log('Processing event:', event || 'unknown');
    await linkMostRelevantArticle(event);
  }
};

export default run;
