const amqp =
require('amqplib');

const sendToQueue =
async (payload) => {

  try {

    const connection =
      await amqp.connect(
        `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
      );

    const channel =
      await connection
      .createChannel();

    const queue =
      'applications';

    await channel
    .assertQueue(
      queue,
      {
        durable:
        true,
      }
    );

    channel.sendToQueue(
      queue,
      Buffer.from(
        JSON.stringify(
          payload
        )
      )
    );

    console.log(
      'Message sent:',
      payload
    );

    setTimeout(
      () => {
        connection.close();
      },
      500
    );

  } catch (error) {

    console.log(
      error
    );
  }
};

module.exports = {
  sendToQueue,
};