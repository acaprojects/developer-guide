# Setup a Development Environment

The ACAEngine development environment runs on MacOS, Windows, or Linux -- feel free to pick where you work best.

This environment contains virtualised infrastructure and reflects what you will use within a production deployment. To run this, you will need two common tools:

1.  [Vagrant](https://www.vagrantup.com/downloads.html): a tool for managing virtual environments.
2.  A virtualisation provider, such as [VirtualBox](https://www.virtualbox.org/wiki/Downloads).

?> We recommend VirtualBox since it's free, open source and available on every major platform, but you can swap this for any of the [other supported providers](https://www.vagrantup.com/docs/providers/) if you prefer or already have them available.

Outside of these, nothing will need to be installed or modified on your machine.

Setup these tools now, then drop back. We've prepared some music to play while you do this.

<iframe width="560" height="315" src="https://www.youtube.com/embed/S5PvBzDlZGs" frameborder="0" allowfullscreen></iframe>

---

Welcome back.

Now that you have the required tools, [download or clone the ACAEngine development environment](https://github.com/acaprojects/setup-dev). This will tell Vagrant how to create and deploy your environment.

Open a terminal in the containing folder and run:
```bash
vagrant up
```

Your environment will provision and when it's ready to go you will be provided with a URL and authentication details to log in. Congratulations you're ready to go!

When you're done working with ACAEngine use
```bash
vagrant halt
```
to shutdown your environment.

!> Vagrant commands need to run within the folder containing the environment configuration (i.e. where you saved the `setup-dev` repository). If you get an error that says "A Vagrant environment or target machine is required to run this command", check that you're in the right place.

You can continue to use these two commands to start and stop your local ACAEngine instance as you need.

Changes that you make, such as adding or removing devices, systems, or zones will persist across restarts. To return to a fresh deployment run:
```bash
vagrant destroy
```

The entire environment is stored within the `setup-dev` directory. You can move this between machines by copying the entire `setup-dev` folder. Or, to remove the ACAEngine development environment from your machine, delete it.
