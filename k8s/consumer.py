from kafka import KafkaConsumer
from time import sleep
from json import loads

consumer = KafkaConsumer(
    client_id="harry",
    group_id="baz",
    bootstrap_servers=["kafka:9092"],
    consumer_timeout_ms=1000
)
 
consumer.subscribe(topics=["test"])
while True:
    for message in consumer:
        print("Consumed")
        print(message.value)