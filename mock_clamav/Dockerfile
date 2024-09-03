FROM python:3.12.0-bookworm

WORKDIR /code

COPY . .
RUN pip install -r requirements.txt

CMD [ "python", "app.py" ]