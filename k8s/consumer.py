from kafka import KafkaConsumer
from time import sleep
from json import loads

consumer = KafkaConsumer(
    group_id="baz",
    bootstrap_servers=["kafka:9092"],
    consumer_timeout_ms=1000
)

consumer.subscribe(topics=["test"])
for message in consumer:
    print("Consumed")
    print(message.value)