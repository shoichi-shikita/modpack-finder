import { handleYouTube } from '../../server/youtube/handler.js';
export const onRequest = ({ request, env }) => handleYouTube(request, env);
