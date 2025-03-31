## Getting started

### Table of Content
* [Setting up domain](#section-1)
* [Setting up Mail Routing](#section-2)
* [Setting up API key](#section-3)
* [Configuring extension](#section-4)

### <a name="section-1"></a> Set up Domain

1. Add a domain (if you don't have one)

Log into your cloudflare account and add a new domain
   
![Screenshot 2025-03-31 at 17 51 41 1](https://github.com/user-attachments/assets/19d506c2-4a9c-4ba7-a3aa-3be55e88e4fc)


2. Select Free tier

![Screenshot 2025-03-31 at 17 51 58 1](https://github.com/user-attachments/assets/d6862969-aede-4861-89aa-e8c6941b3346)

3. Configure DNS records (make sure to delete old MX records from registar)

![Group 1](https://github.com/user-attachments/assets/96ea5440-f84a-46db-b7f3-72f482c6212e)

4. Activate domain and set Cloudflare DNS in your registar for this domain

![Screenshot 2025-03-31 at 17 53 56 1](https://github.com/user-attachments/assets/5d0d0b9d-71bf-4d8d-a36f-f385b7097608)


### <a name="section-2"></a> Set up Mail Routing

1. Open **Email -> Email Routing** and click Get Started

![Screenshot 2025-03-31 at 18 28 42 1](https://github.com/user-attachments/assets/823a5564-042b-43ee-9362-be020698b2dc)

2. Apply Cloudflare DNS records

![Screenshot 2025-03-31 at 18 14 34](https://github.com/user-attachments/assets/424f40d7-2275-4c4a-84ef-94ad2013a412)

3. Add your first address and destination email. You will get a verification email from Cloudflare to verify your destination address.

![Screenshot 2025-03-31 at 18 29 39 1](https://github.com/user-attachments/assets/33910de2-d3d4-4058-8a9f-a1d8d31692cc)


4. Make sure your Email Routing is **configured** and **enabled**

![Screenshot 2025-03-31 at 18 14 44](https://github.com/user-attachments/assets/dedfb3f3-ab5e-4abd-8a11-8b889113131a)


### <a name="section-3"></a> Set up API key

1. In Domain Overview, save your **Zone ID** and **Account ID**, you will need them to configure extension, and click **Get your API token**

![Group 2](https://github.com/user-attachments/assets/f1c8d4a5-71a4-4797-b30a-6bba3ceaf070)


2. Click **Create token** and add following permissions, create it and **save the token**

![Frame 2 (1)](https://github.com/user-attachments/assets/08e50b45-a092-4353-b767-a84bb61b43e7)


### <a name="section-4"></a> Configure extension

When you open the extension you will be prompted to enter your account ids and api token along with destination email.

<img width="295" alt="Screenshot 2025-03-31 at 21 45 07" src="https://github.com/user-attachments/assets/255f1ba4-db2e-43a4-b549-f2cca0283b74" />

Click save and you are good to go!

Note: it may take a minute or so to create your temp addresses and wait while Cloudflare syncs your settings with their servers.


