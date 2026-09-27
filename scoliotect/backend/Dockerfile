FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt ./
# ultralytics drags in GUI opencv-python (needs libGL, missing on slim);
# swap it for headless AFTER install (predict only needs cv2 core, e.g. cvtColor).
# --force-reinstall: uninstalling opencv-python deletes the shared cv2/ files,
# a plain reinstall would be a no-op ("requirement satisfied") leaving cv2 broken.
# The import check fails the build loudly if cv2 is ever broken again.
RUN pip install --no-cache-dir -r requirements.txt \
 && pip uninstall -y opencv-python opencv-contrib-python || true \
 && pip install --no-cache-dir --force-reinstall --no-deps opencv-python-headless \
 && python -c "import cv2; print('cv2', cv2.__version__)"
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
