<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Session access
- Participant characters use one shared catalog and SVG renderer; persist nullable IDs on players through the validated join_game overload, keeping legacy entry and neutral fallback to avoid disrupting the published client.
- Keep primary branding in the shared Brand components using the original image asset; preserve existing session URLs and storage keys so rebranding does not interrupt access.
- Keep question-time options and normalization in the shared game module so the editor default and legacy conversion use the same allowed values.
- Activity saves use explicit IDs for every question, check returned quiz/question rows, retain retry IDs, invalidate the teacher list and warn on unsaved navigation to prevent silent loss.
- Direct reads of games and players are restricted to the session host; guest students use the existing PIN/join/status/question RPCs and polling fallback so participation requires no account.
- Question image uploads use a focused field with shared validation and UID-prefixed private Storage paths saved in image_path; image_url remains a legacy fallback to preserve old questions.
- Anonymous image signing goes through a server function that verifies the player capability and current question with authorize_question_image before privileged signing; no anonymous Storage SELECT/list/write access is needed.
- Image-only questions store letter options and a separate correct index so the existing answer and scoring RPCs remain unchanged.
- Removing or replacing a question image changes the saved reference only; retain old objects because duplicated activities can share an image and deletion would break them.