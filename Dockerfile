
FROM ubuntu:18.04

RUN apt-get update \
  && apt-get install -y python3-pip python3-dev git \
  && cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 install --upgrade pip

RUN pip install pymongo \
  && pip install flask

ADD ./project /project

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
EXPOSE 5000

CMD python /project/server.py
