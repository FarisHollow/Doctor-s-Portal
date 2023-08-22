import { HttpException, HttpStatus, Injectable, Res, Session } from '@nestjs/common';
import { AddDocotorDTO, DoctorEntity, LoginDTO } from './Doctor.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { AppointmentEntity } from './appointment.entitiy';
import * as bcrypt from 'bcrypt';
import { NotificationEntity } from './Notification.entity';
import { CurrentDate, CurrentTime } from './current.date';
import { Article, ArticleEntity } from './article.entity';
import { ReferEntity } from './refer.entity';
import { PatientEntity } from 'src/Patient/Patient.dto';
import { FileEntity } from './file.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { MailerEntity } from './mailer.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorEntity)
    private DoctorRepo: Repository<DoctorEntity>,
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
    @InjectRepository(NotificationEntity)
    private notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(ArticleEntity)
    private articleRepo: Repository<ArticleEntity>,
    @InjectRepository(ReferEntity)
    private referRepo: Repository<ReferEntity>,
    @InjectRepository(PatientEntity)
    private patientRepo: Repository<PatientEntity>,
    @InjectRepository(FileEntity)
    private fileRepo: Repository<FileEntity>,
    @InjectRepository(MailerEntity)
    private mailerRepo: Repository<MailerEntity>,
    private mailerService: MailerService
  ) {}
  async addDoctor(data: AddDocotorDTO): Promise<string> {
    const salt = await bcrypt.genSalt();
    data.password = await bcrypt.hash(data.password, salt);
    console.log(data.password);
    console.log("Account Created Successfully");
    try {
      const savedDoctor = await this.DoctorRepo.save(data);
  
      const notiFication: NotificationEntity = new NotificationEntity();
      notiFication.doctor = savedDoctor; 
      notiFication.Message = "Account Created Successfully";
      const currentDate: CurrentDate = new CurrentDate();
      const currentTime: CurrentTime = new CurrentTime();
  
      notiFication.date = currentDate.getCurrentDate();
      notiFication.time = currentTime.getCurrentTime();
      await this.notificationRepo.save(notiFication);
      return "Registration successful"
  
    } catch (error) {
      console.error(error);
      return "Registration failed"
    }
  }
  
  
  async viewNotification(id: number): Promise<NotificationEntity[]> {
    const doctor = await this.DoctorRepo.findOne({ where: { id } })
  
    const notifications = await this.notificationRepo.find({
      where: {
        doctor: doctor,
      },
    });
  
    return notifications;
  }
  
  
  
  async ViewProfile(id: number): Promise<DoctorEntity[]> {
    const visit = await this.DoctorRepo.find({
      select: {
        name: true,
        email: true,
        id: true,
        Gender:true,
        Blood_group:true,
        Degree:true,
        password: false
      },
      where: {
        id: id,
      }
    });
  
    const doctor = visit[0];
    const notiFication: NotificationEntity = new NotificationEntity();
    notiFication.doctor = doctor; 
    notiFication.Message = "Profile Visited";
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
  
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    await this.notificationRepo.save(notiFication);
    return visit;
  }

  async Edit(email: string, updateDoctor: AddDocotorDTO): Promise<DoctorEntity> {
    const salt = await bcrypt.genSalt();
    updateDoctor.password = await bcrypt.hash(updateDoctor.password, salt);
    
    const updateResult = await this.DoctorRepo.update({ email }, updateDoctor);
    const doctor = await this.DoctorRepo.findOne({
      where: {
        email: email,
      },
    });
    
    const notiFication: NotificationEntity = new NotificationEntity();
    notiFication.doctor = doctor;
    notiFication.Message = "Account Edited Successfully";
    
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    
    await this.notificationRepo.save(notiFication);
    
    return doctor;
    
  }
  
  
  async Searching(id: number, email: string): Promise<DoctorEntity[]> {

    
    try {
      const search = await this.DoctorRepo.find({
        select: {
          name: true,
          email: true,
          id: true,
          password: false,
        },
        where: {
          id: id,
        },
      });
    
      const searchDoctor = await this.DoctorRepo.find({
        select: {
          name: true,
          email: true,
          id: true,
          password: false,
        },
        where: {
          email: email,
        },
      });
    
      if (search.length === 0) {
        throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
      }
    
      const doctor = searchDoctor[0];
      const notiFication: NotificationEntity = new NotificationEntity();
      notiFication.doctor = doctor;
      notiFication.Message = 'Search a profile';
      const currentDate: CurrentDate = new CurrentDate();
      const currentTime: CurrentTime = new CurrentTime();
    
      notiFication.date = currentDate.getCurrentDate();
      notiFication.time = currentTime.getCurrentTime();
      await this.notificationRepo.save(notiFication);
    
      return search;
    } catch (error) {

      throw new HttpException('Data Not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }
  
  // async ChangePassword(email: string, password: string): Promise<DoctorEntity> {
  //   const doctor = await this.DoctorRepo.findOne({
  //     select: {
  //       password: true
  //     },
  //     where: {
  //       email: email,
  //     }
  //   });
  
  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(password.toString(), salt);
  
  //   await this.DoctorRepo.update({ email }, { password: hashedPassword });
  
  //   const updatedDoctor = await this.DoctorRepo.findOne({
  //     where: {
  //       email: email,
  //     },
  //   });

  //   if (updatedDoctor) {
  //     const notiFication: NotificationEntity = new NotificationEntity();
  //     const currentDate: CurrentDate = new CurrentDate();
  //     const currentTime: CurrentTime = new CurrentTime();
  //     notiFication.Message = "Password Changed Successfully"; 
  //     notiFication.date = currentDate.getCurrentDate();
  //     notiFication.time = currentTime.getCurrentTime();
  //     notiFication.doctor = updatedDoctor;
  
  //     await this.notificationRepo.save(notiFication);
  //   } else {
   
  //     throw new Error("Doctor not found or invalid email");
  //   }

  
  //   const notiFication: NotificationEntity = new NotificationEntity();
  
  
  //   await this.notificationRepo.save(notiFication);
  
  //   return updatedDoctor;
  // }
  async addArticle(data: Article, email: string): Promise<ArticleEntity> {
    const doctor = await this.DoctorRepo.findOne({
      where: { email: email },
    });
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    const articlePost: ArticleEntity = new ArticleEntity();
  
 
  
    articlePost.name = data.name;
    articlePost.Link = data.Link;
    articlePost.Publish_date = currentDate.getCurrentDate();
    articlePost.Publish_time = currentTime.getCurrentTime();
    articlePost.doctor=doctor;
    const savedArticle = await this.articleRepo.save(articlePost);

    console.log("Article Posted Successfully");
   
      const notiFication: NotificationEntity = new NotificationEntity();
      notiFication.Message = "Post Article"; 
      notiFication.date = currentDate.getCurrentDate();
      notiFication.time = currentTime.getCurrentTime();
      notiFication.doctor = doctor;
  
      await this.notificationRepo.save(notiFication);
  
    return savedArticle;
  }
  
  
 
  async Refer(data: ReferEntity, email: string): Promise<ReferEntity> {
    const doctor = await this.DoctorRepo.findOne({
      where: { email: email },
    });
    
    const makeRefer: ReferEntity = new ReferEntity();
    makeRefer.Refer = data.Refer;
    makeRefer.ReferTo = data.ReferTo;
    makeRefer.doctor = doctor; 
    const savedRefer = await this.referRepo.save(makeRefer);
  
    const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Refer a doctor"; 
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = doctor;
  
    await this.notificationRepo.save(notiFication);
    return savedRefer;
  }
  async addAppointment(appointment: any,id): Promise<AppointmentEntity | string> {
    const makeAppointment: AppointmentEntity = new AppointmentEntity();
    const doctor = await this.DoctorRepo.findOne({ where: { id } });
  
    const PatientEmail = appointment.email;
    let Patient: PatientEntity;
    try {
      Patient = await this.patientRepo.findOne({ where: { email: PatientEmail } });
      if (!Patient) {
        return "Invalid Email";
      }
    } catch (error) {
      return "Error fetching patient";
    }
  
    appointment.patient = Patient.id;
    appointment.doctor = id;
    makeAppointment.name = Patient.name; 
    makeAppointment.age = appointment.age;
    makeAppointment.email = Patient.email;

    makeAppointment.date = appointment.date;
    makeAppointment.time = appointment.time;
    makeAppointment.doctor = appointment.doctor;
    makeAppointment.patient = appointment.patient;
    console.log("completeAppointment")

    const completeAppointment=await this.appointmentRepo.save(makeAppointment);
    console.log(completeAppointment)
    const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Make an Appointment";
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = doctor;
  
    await this.notificationRepo.save(notiFication);
    return completeAppointment;
  }
  
  
  
  

  async viewAppointment(id:any): Promise<DoctorEntity[]> {
    const AllAppointment = await this.DoctorRepo.find({
      where: { id },
      relations: {
        appointment: true,
      },
    });
    const doctor = await this.DoctorRepo.findOne({ where: { id } });

    const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Cheak all Appointment"; 
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = doctor;
  
    await this.notificationRepo.save(notiFication);
    return AllAppointment;
  }
  async deleteAllAppointments(id: number): Promise<string> {
    const doctor = await this.DoctorRepo.findOne({ where: { id } });
    const appointments = await this.appointmentRepo.find({
      where: { doctor },
      relations: ['doctor'], 
    });
  
    await this.appointmentRepo.remove(appointments);

    const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Cancel all Appointment"; 
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = doctor;
    await this.notificationRepo.save(notiFication);
    return "All appointments deleted";
  }
  

 
  
  async deleteOneAppointment(id: number, serial: number): Promise<string> {
    const doctor = await this.DoctorRepo.findOne({ where: { id } });
    let appointment: AppointmentEntity;
  
    try {
      appointment = await this.appointmentRepo.findOne({
        where: { doctor: doctor, Serial: serial },
        relations: ['doctor'],
      });
  
      if (!appointment) {
        return "Invalid Serial Number";
      }
  
      await this.appointmentRepo.remove(appointment);
  
      const notiFication: NotificationEntity = new NotificationEntity();
      const currentDate: CurrentDate = new CurrentDate();
      const currentTime: CurrentTime = new CurrentTime();
      notiFication.Message = "Delete a single Appointment";
      notiFication.date = currentDate.getCurrentDate();
      notiFication.time = currentTime.getCurrentTime();
      notiFication.doctor = doctor;
      await this.notificationRepo.save(notiFication);
  
      return "Appointment deleted";
    } catch (error) {
      return "Error deleting Appointment";
    }
  }
  
  

  async updateAppointment(id: any, serial: number, data: AppointmentEntity): Promise<AppointmentEntity  | string> {
    const doctor = await this.DoctorRepo.findOne({ where: { id } });
    const appointment = await this.appointmentRepo.findOne({
      where: { doctor: doctor, Serial: serial },
      relations: ['doctor'],
    });
  
    if (!appointment) {
      return "Don't find any appointment";
    }
  
    await this.appointmentRepo.update(serial, data);
    const UpdateAppointment= this.appointmentRepo.findOne({
      where: { Serial: serial },
    });


    
    const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Update a Appointment";
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = doctor;
    await this.notificationRepo.save(notiFication);


    return UpdateAppointment;
  }
  
  async signIn(data: LoginDTO): Promise<boolean> {
    const userData = await this.DoctorRepo.findOneBy({ email: data.email });
  
    if (userData !== undefined) {
      const match: boolean = await bcrypt.compare(data.password, userData.password);
      const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Logged in a device";
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = userData;
    await this.notificationRepo.save(notiFication);
      return match;
    }
  
    return false;
  }

  async Logout(@Session() session, email: string) {
    const Search = await this.DoctorRepo.find({
      select: {
        name: true,
        id: true,
        password: false
      },
      where: {
        email: email,
      }
    });
  
    const doctor = Search[0];
  
    const notiFication: NotificationEntity = new NotificationEntity();
    notiFication.doctor = doctor;
    notiFication.Message = "Logged Out";
  
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
  
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
  
    await this.notificationRepo.save(notiFication);
  
    session.destroy();
    return "Logout Successfully";
  }

  async uploadFile(email: string, FileFullName: string): Promise<string> {
    const doctor = await this.DoctorRepo.findOne({ where: { email } });    
    console.log(FileFullName)
  
    const Fileobj: FileEntity = new FileEntity();
    Fileobj.File = FileFullName;
  
    Fileobj.doctor = doctor;
    await this.fileRepo.save(Fileobj);
    const notiFication: NotificationEntity = new NotificationEntity();
    notiFication.doctor = doctor;
    notiFication.Message = "Profile Picture Uploaded";
  
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
  
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
  
    await this.notificationRepo.save(notiFication);
  
    return 'File uploaded successfully';
  }
  



  async getImages(email: string, res: any) {
    const doctor = await this.DoctorRepo.findOne({
      where: {
        email: email,
      },
    });
  
    try {
      const nameFile = await this.fileRepo.findOne({
        where: {
          doctor: doctor,
        },
      });
      const name=nameFile.File;
  
      res.sendFile(name, { root: './DoctorFiles' })

      
      const notiFication: NotificationEntity = new NotificationEntity();
      notiFication.doctor = doctor;
      notiFication.Message = "Preview Profile Picture";
  
      const currentDate: CurrentDate = new CurrentDate();
      const currentTime: CurrentTime = new CurrentTime();
  
      notiFication.date = currentDate.getCurrentDate();
      notiFication.time = currentTime.getCurrentTime();
  
      await this.notificationRepo.save(notiFication);
    } catch (error) {
      return "Missing Profile Picture";
    }
  
    return "Preview Profile Picture";
  }
  
  async sendEmail(email: string, emailData: any):Promise<String> {
    const doctor = await this.DoctorRepo.findOne({
      where: {
        email: email,
      },
    });
    try {
        
      const currentDate: CurrentDate = new CurrentDate();
      const currentTime: CurrentTime = new CurrentTime();
      await this.mailerService.sendMail(emailData);
      const mailer: MailerEntity = new MailerEntity();
      mailer.to = emailData.to;
      mailer.subject = emailData.subject;
      mailer.text = emailData.text;
      mailer.doctor = doctor;
      mailer.Date=currentDate.getCurrentDate();
      mailer.Time=currentTime.getCurrentTime();
      await this.mailerRepo.save(mailer);
      const notiFication: NotificationEntity = new NotificationEntity();
      notiFication.doctor = doctor;
      notiFication.Message = "Sent a Email";

  
      notiFication.date = currentDate.getCurrentDate();
      notiFication.time = currentTime.getCurrentTime();
  
      await this.notificationRepo.save(notiFication);
    } catch (error) {
      return "Email doesn't sent";

    }
    return "Email Send successfully";

  }
  
  async checkEmailHistory(email: string): Promise<any> {
    const mailes = await this.DoctorRepo.find({
      where: { email },
      relations: {
        mail: true,
      },
    });
    const doctor = await this.DoctorRepo.findOne({ where: { email } });

    const notiFication: NotificationEntity = new NotificationEntity();
    const currentDate: CurrentDate = new CurrentDate();
    const currentTime: CurrentTime = new CurrentTime();
    notiFication.Message = "Cheak Email History"; 
    notiFication.date = currentDate.getCurrentDate();
    notiFication.time = currentTime.getCurrentTime();
    notiFication.doctor = doctor;
  
    await this.notificationRepo.save(notiFication);
    return mailes;
  }
  
  
  }
  
