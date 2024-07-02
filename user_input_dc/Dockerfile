FROM node:19-alpine AS appbuild
COPY ./code/input/react/package.json /
RUN npm install
RUN npm -v
COPY ./code/input/react/ /
RUN npm run build

FROM digitalshoestring/shoestring-django:v0.0.1
ENV PYTHONUNBUFFERED 1
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt && rm -f /requirements.txt
WORKDIR /app
ADD ./code /app/
COPY --from=appbuild /build /app/static
COPY --from=appbuild /build /app/input/static
COPY --from=appbuild /build/index.html /app/input/templates/index.html
