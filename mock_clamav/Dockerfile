FROM python:3.13-alpine3.21

WORKDIR /code

COPY . .
RUN pip install -r requirements.txt

CMD [ "python", "app.py" ]