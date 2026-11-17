# Qool — Google Flow prompt generator

React + TypeScript + Vite. Prompt-only mode creates prompts locally for manual use in [Google Flow](https://labs.google/fx/tools/flow). An optional local Vertex AI backend supports in-page Veo video generation with your own authorized Google project and credits/billing. Qool does not automate the Flow website or transcribe audio.

## Development

From `frontend/`, with Node 24 and npm:

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

If the environment restricts writes to the npm cache, use `npm ci --cache /tmp/qool-npm-cache`.

```sh
npm run build
npm run lint
node --experimental-strip-types --test tests/flowPrompt.test.ts
```

## Workflow

Home → Upload Portrait → Add Text → Voice Selection → Generate Flow Prompt → Prompt Ready.

Upload a readable JPG/JPEG or PNG (maximum 10 MB), or select an existing example. Enter the exact dialogue, including Arabic/English/French code-switching. Choose language, accent, descriptive voice preference, speaking style and speed. Review the short-clip duration warning, then generate, copy, or download the UTF-8 prompt. Open Flow, upload the same portrait, choose an available model, paste the prompt, generate, and download the video there. Voice matching and lip synchronization depend on Flow and are not guaranteed.

Drafts, including uploaded images and optional audio, are saved locally in IndexedDB and restored on refresh in the same browser/origin. In prompt-only mode, no uploads are sent to a server. Opting into Veo generation sends the portrait and generated prompt through the local backend to Google. If storage is unavailable, a notice explains that the in-memory draft may be lost on refresh. Start a new prompt clears the draft after confirmation. Browser data clearing removes saved drafts.

Audio is retained as an optional local reference and explicitly excluded from the prompt/download. Enter the recording's exact transcript in the text tab; Qool does not transcribe or automatically lip-sync audio.

`/prompt-ready` is the result route; `/video-ready` remains compatible with existing links. Direct access to later steps redirects to the first missing prerequisite.

## Manual browser checks

Exercise the complete workflow with both an example and an uploaded portrait. Try invalid MIME types, a corrupt PNG, and files over 10 MB. Verify mixed-language dialogue (including newlines/spaces) is unchanged, preferences affect the prompt, a long script shows a warning, and retained audio remains visible after navigation and refresh. Copy and compare clipboard content; deny clipboard access and check the fallback message. Download the text and compare its content. Verify the Flow link opens a separate tab at the official URL. Check back navigation, refresh, missing prerequisites, and 375px mobile layouts.

## Optional built-in Veo video generation

A local Vertex AI backend is available in [`../backend`](../backend/README.md). Follow its Windows setup instructions to configure your own authorized Google project, ADC credentials, quota, and credits/billing. Start backend and frontend in separate terminals. Generation is disabled by default and requires an explicit cost/data acknowledgment in Qool; it is not a free Google Flow API. The Generate page supports real job polling, a returned video player, and MP4 download while preserving the original prompt-only route. No live generation is verified until your project is configured and a real request succeeds.
