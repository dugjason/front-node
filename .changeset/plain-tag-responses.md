---
"@dugjason/front-node": major
---

Tags now use collection-first methods and plain TagResponse data. Remove the Tag entity and its save/refresh lifecycle; call front.tags operations with the returned ID. Rename tag request types to CreateTagParams, CreateChildTagParams, and UpdateTagParams. listChildren preserves the list envelope instead of returning an entity array. Company and team tag creation return plain responses. Updates and deletes return void without a follow-up fetch.

Pagination metadata now preserves the full next-page URL. Tags list methods accept nextPageUrl, using its query parameters and ignoring other supplied list options. Use pageTokenFromPaginationNextUrl for explicit token-based calls on collections that have not yet migrated.

Team tag methods now take the team ID first: front.teams.listTags(teamId, params) and front.teams.createTag(teamId, params). Team tag lists support nextPageUrl.

Company tag listing supports nextPageUrl and typed pagination metadata. Export CreateCompanyTagParams and ListCompanyTagsParams for company-scoped requests.
