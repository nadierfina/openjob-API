require('dotenv')
.config();

const amqp =
require('amqplib');

const nodemailer =
require('nodemailer');

const pool =
require('./database/pool');


// EMAIL CONFIG
const transporter =
nodemailer
.createTransport({

  host:
    process.env
    .MAIL_HOST,

  port:
    process.env
    .MAIL_PORT,

  secure:
    false,

  auth: {

    user:
      process.env
      .MAIL_USER,

    pass:
      process.env
      .MAIL_PASSWORD,
  },
});


const init =
async () => {

  try {

    // CONNECT RABBITMQ
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

    console.log(
      'Consumer running...'
    );

    channel.consume(
      queue,

      async (
        message
      ) => {

        try {

          const payload =
            JSON.parse(
              message
              .content
              .toString()
            );

          console.log(
            'MESSAGE:',
            payload
          );

          const {
            application_id
          } = payload;

          // QUERY DATABASE
         const result =
          await pool.query(
            `
            SELECT
              applicant.email
              AS applicant_email,

              applicant.name
              AS applicant_name,

              NOW()
              AS created_at,

              owner.email
              AS owner_email,

              jobs.title
              AS job_title,

              companies.name
              AS company_name

            FROM applications

            JOIN users applicant
            ON applications.user_id =
            applicant.id

            JOIN jobs
            ON applications.job_id =
            jobs.id

            JOIN companies
            ON jobs.company_id =
            companies.id

            JOIN users owner
            ON jobs.user_id =
            owner.id

            WHERE applications.id
            = $1
            `,
            [
              application_id
            ]
          );
          // APPLICATION NOT FOUND
          if (
            !result.rows
            .length
          ) {

            console.log(
              'Application not found'
            );

            return;
          }

          const data =
            result.rows[0];

          // SEND EMAIL
          await transporter
          .sendMail({

            from:
              process.env
              .MAIL_USER,

            to:
              data.owner_email,

            subject:
              'Lamaran Kerja Baru',

            html:
            `
            <h2>
              Kandidat Baru Melamar
            </h2>

            <p>
              Ada kandidat baru
              melamar pekerjaan:
            </p>

            <p>
              <b>Lowongan:</b>
              ${data.job_title}
            </p>

            <p>
              <b>Perusahaan:</b>
              ${data.company_name}
            </p>

            <hr>

            <p>
              <b>Email Pelamar:</b>
              ${data.applicant_email}
            </p>

            <p>
              <b>Nama Pelamar:</b>
              ${data.applicant_name}
            </p>

            <p>
              <b>Tanggal Lamaran:</b>
              ${data.created_at}
            </p>
            `,
          });

          console.log(
            'Email sent'
          );

          channel.ack(
            message
          );

        } catch (error) {

          console.log(
            'Consumer error:',
            error.message
          );
        }
      }
    );

  } catch (error) {

    console.log(
      error
    );
  }
};

init();